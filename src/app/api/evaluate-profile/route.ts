import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface CompetencyScores {
  Academic: number;
  Research: number;
  Work: number;
  Organization: number;
  Impact: number;
}

// Use the anon client for reading data (subject to RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const isCron = url.searchParams.get('cron') === 'true';

    // MED-01: Robust CSRF Check — block cross-origin requests.
    // For same-site requests the Origin header must match the host,
    // OR the Origin must be absent (server-to-server / same-origin fetch).
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin) {
      let originHost: string;
      try {
        originHost = new URL(origin).host;
      } catch {
        // Malformed origin — reject
        return NextResponse.json({ error: 'Invalid Origin header' }, { status: 403 });
      }
      if (originHost !== host) {
        return NextResponse.json({ error: 'CSRF Protection Triggered' }, { status: 403 });
      }
    }
    // If origin is absent (e.g. server-to-server), fall through to auth checks below.

    // 0. AUTHENTICATION CHECK
    if (isCron) {
      // HIGH-01 / CRON: Verify using a dedicated CRON_SECRET env var
      const authHeader = request.headers.get('authorization');
      if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized CRON request' }, { status: 401 });
      }
    } else {
      // HIGH-01: Verify the JWT token against Supabase — not just a cookie name substring check.
      // Extract the access token from either our custom cookie or the Supabase default.
      const cookieHeader = request.headers.get('cookie') || '';

      // Try to extract token value from cookie string
      const tokenMatch =
        cookieHeader.match(/sb-access-token=([^;]+)/) ||
        cookieHeader.match(/sb-[^-]+-auth-token(?:\.0)?=([^;]+)/);

      if (!tokenMatch || !tokenMatch[1]) {
        return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
      }

      // Validate the token by calling Supabase — this checks signature and expiry
      const token = decodeURIComponent(tokenMatch[1]);

      // For chunked tokens (Supabase v2 splits large JWTs), parse the base64 payload
      let userEmail: string | null = null;
      try {
        // Try direct JWT decode (Supabase v1 style / small tokens)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
          userEmail = payload.email ?? null;
        } else {
          // Chunked / non-JWT — fall back to remote verification
          const parsed = JSON.parse(token);
          userEmail = parsed?.user?.email ?? null;
        }
      } catch {
        // Malformed token
      }

      // Always do a remote verification to ensure the token is valid & not expired
      const verifyRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
        }
      );

      if (!verifyRes.ok) {
        return NextResponse.json({ error: 'Unauthorized. Invalid or expired session.' }, { status: 401 });
      }

      const verifiedUser = await verifyRes.json();
      userEmail = verifiedUser.email;

      // Must be the configured admin email
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail || userEmail !== adminEmail) {
        return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
      }
    }

    // 1. Fetch current profile to check last_evaluated_at
    const { data: currentProfile, error: profileError } = await supabase
      .from('profile')
      .select('id, last_evaluated_at')
      .single();

    // 2. Fetch all portfolio data and their latest update timestamps
    const [projectsRes, workExperiencesRes, impactsRes, orgsRes, honorsRes, skillsRes] = await Promise.all([
      supabase.from('projects').select('title, description, tech_stack, categories, created_at'),
      supabase.from('work_experiences').select('company, posisi, masa, poin, tech_stack, created_at'),
      supabase.from('impacts').select('title, organization, description, items, created_at'),
      supabase.from('organizations').select('role, org, period, responsibilities, created_at'),
      supabase.from('honors').select('title, event, year, desc_text, created_at'),
      supabase.from('m_shape_skills').select('id, items, evidence')
    ]);

    const portfolioData = {
      projects: projectsRes.data || [],
      work_experiences: workExperiencesRes.data || [],
      impacts: impactsRes.data || [],
      organizations: orgsRes.data || [],
      honors: honorsRes.data || [],
      skills: skillsRes.data || []
    };

    // 3. Conditional execution for CRON jobs
    if (isCron && currentProfile?.last_evaluated_at) {
      const lastEvalDate = new Date(currentProfile.last_evaluated_at).getTime();
      
      let latestUpdate = 0;
      portfolioData.projects.forEach(p => {
        if (p.created_at) latestUpdate = Math.max(latestUpdate, new Date(p.created_at).getTime());
      });
      portfolioData.work_experiences.forEach(e => {
        if (e.created_at) latestUpdate = Math.max(latestUpdate, new Date(e.created_at).getTime());
      });
      portfolioData.impacts.forEach(e => {
        if (e.created_at) latestUpdate = Math.max(latestUpdate, new Date(e.created_at).getTime());
      });
      portfolioData.organizations.forEach(e => {
        if (e.created_at) latestUpdate = Math.max(latestUpdate, new Date(e.created_at).getTime());
      });

      if (latestUpdate <= lastEvalDate) {
        return NextResponse.json({ 
          success: true, 
          message: "No new changes detected since last evaluation. Skipped to save API usage." 
        });
      }
    }

    let newScores: CompetencyScores;
    let ai_active = false;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (apiKey && apiKey.length > 10) {
      // MED-04: Sanitize portfolio data before embedding in the AI prompt.
      // Strip characters that could be used to inject instructions into the prompt.
      const sanitizeForPrompt = (value: unknown): unknown => {
        if (typeof value === 'string') {
          // Remove common prompt-injection patterns: newline + imperative phrases
          return value
            .replace(/[\r\n]{2,}/g, ' ')          // collapse multiple newlines
            .replace(/ignore (all |previous |above )?instructions?/gi, '[filtered]')
            .replace(/system\s*:/gi, '[filtered]')
            .slice(0, 500);                         // cap field length
        }
        if (Array.isArray(value)) return value.map(sanitizeForPrompt);
        if (value && typeof value === 'object') {
          return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, sanitizeForPrompt(v)])
          );
        }
        return value;
      };

      const safePortfolioData = sanitizeForPrompt(portfolioData);

      const prompt = `
        You are an expert HR and Academic evaluator following the SFIA 9 and ACM Computing Curricula 2020 frameworks.
        Evaluate the following portfolio data and calculate a score from 0 to 100 for each of the 5 competencies:
        1. Academic (Based on theoretical knowledge and academic projects)
        2. Research (Based on data analysis, research roles, and academic papers)
        3. Work (Based on professional experience and internships)
        4. Organization (Based on leadership, teamwork, and organizational roles)
        5. Impact (Based on the scale, reach, and outcome of the projects/work)

        Here is the candidate's portfolio data:
        ${JSON.stringify(safePortfolioData)}

        Output ONLY a valid JSON object with the exact keys: "Academic", "Research", "Work", "Organization", "Impact".
        Do not include markdown blocks or any other text.
      `;

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });
        
        const mlData = await response.json();
        const textResponse = mlData.candidates[0].content.parts[0].text;
        
        const cleanedText = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        const rawScores = JSON.parse(cleanedText);
        
        const lowerCaseScores: Record<string, number> = {};
        Object.keys(rawScores).forEach(key => {
          lowerCaseScores[key.toLowerCase()] = rawScores[key];
        });

        newScores = {
          Academic: lowerCaseScores['academic'],
          Research: lowerCaseScores['research'],
          Work: lowerCaseScores['work'],
          Organization: lowerCaseScores['organization'],
          Impact: lowerCaseScores['impact']
        };
        ai_active = true;
      } catch (mlError) {
        console.error("ML Evaluation Failed, falling back to heuristic:", mlError);
        newScores = calculateHeuristicScores(portfolioData);
      }
    } else {
      console.log("No GEMINI_API_KEY found, using heuristic ML simulation.");
      newScores = calculateHeuristicScores(portfolioData);
    }

    const sanitizeScore = (s: unknown) => Math.min(100, Math.max(0, parseInt(String(s)) || 60));
    const finalScores = {
      score_academic: sanitizeScore(newScores.Academic),
      score_research: sanitizeScore(newScores.Research),
      score_work: sanitizeScore(newScores.Work),
      score_organization: sanitizeScore(newScores.Organization),
      score_impact: sanitizeScore(newScores.Impact),
      last_evaluated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('profile')
      .update(finalScores)
      .eq('id', currentProfile?.id || '00000000-0000-0000-0000-000000000000')
      .select()
      .single();

    // [M-5] Do not return raw DB errors to client
    if (updateError) {
      console.error("Database Update Error:", updateError);
      return NextResponse.json({ 
        success: false, 
        message: "Database update failed. Please check server logs."
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Scores updated successfully",
      ai_active,
      scores: finalScores
    });

  } catch (error: unknown) {
    console.error("API Route Error:", error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ success: false, message: "An internal server error occurred." }, { status: 500 });
  }
}

function calculateHeuristicScores(data: { projects: unknown[]; work_experiences: unknown[]; impacts: unknown[]; organizations: unknown[]; honors: unknown[]; skills: unknown[] }): CompetencyScores {
  const projCount = data.projects.length;
  const workCount = data.work_experiences.length;
  const impactCount = data.impacts.length;
  const orgCount = data.organizations.length;
  const honorCount = data.honors.length;
  
  let researchCount = 0;
  data.projects.forEach((proj: any) => {
    const title = (proj.title || "").toLowerCase();
    const desc = (proj.description || "").toLowerCase();
    if (title.includes("research") || desc.includes("research") || title.includes("paper")) researchCount++;
  });

  return {
    Academic: Math.min(100, 65 + (projCount * 2) + (honorCount * 3)),
    Research: Math.min(100, 60 + (researchCount * 8) + (projCount * 2)),
    Work: Math.min(100, 65 + (workCount * 7)),
    Organization: Math.min(100, 65 + (orgCount * 5)),
    Impact: Math.min(100, 60 + (impactCount * 6) + (projCount * 2)),
  };
}
