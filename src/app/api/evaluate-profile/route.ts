import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface CompetencyScores {
  Academic: number;
  Research: number;
  Work: number;
  Organization: number;
  Impact: number;
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const isCron = url.searchParams.get('cron') === 'true';

    // CSRF Check [M-1]
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && !origin.includes(host || '')) {
      return NextResponse.json({ error: 'CSRF Protection Triggered' }, { status: 403 });
    }

    // 0. AUTHENTICATION CHECK [C-1]
    if (isCron) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized CRON request' }, { status: 401 });
      }
    } else {
      const cookieHeader = request.headers.get('cookie') || '';
      // Check for our custom token or Supabase default auth token
      if (!cookieHeader.includes('sb-access-token') && !cookieHeader.includes('-auth-token=')) {
        return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
      }
    }

    // 1. Fetch current profile to check last_evaluated_at
    const { data: currentProfile, error: profileError } = await supabase
      .from('profile')
      .select('id, last_evaluated_at')
      .single();

    // 2. Fetch all portfolio data and their latest update timestamps
    const [projectsRes, experiencesRes, skillsRes] = await Promise.all([
      supabase.from('projects').select('title, description, tags, created_at'),
      supabase.from('experiences').select('company, role, duration, description, created_at'),
      supabase.from('m_shape_skills').select('category, skills')
    ]);

    const portfolioData = {
      projects: projectsRes.data || [],
      experiences: experiencesRes.data || [],
      skills: skillsRes.data || []
    };

    // 3. Conditional execution for CRON jobs
    if (isCron && currentProfile?.last_evaluated_at) {
      const lastEvalDate = new Date(currentProfile.last_evaluated_at).getTime();
      
      // Find the most recent update across projects and experiences
      let latestUpdate = 0;
      portfolioData.projects.forEach(p => {
        if (p.created_at) latestUpdate = Math.max(latestUpdate, new Date(p.created_at).getTime());
      });
      portfolioData.experiences.forEach(e => {
        if (e.created_at) latestUpdate = Math.max(latestUpdate, new Date(e.created_at).getTime());
      });

      // If no updates happened since last evaluation, skip it
      if (latestUpdate <= lastEvalDate) {
        return NextResponse.json({ 
          success: true, 
          message: "No new changes detected since last evaluation. Skipped to save API usage." 
        });
      }
    }

    let newScores: CompetencyScores;
    let ai_active = false; // [C-2]
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (apiKey && apiKey.length > 10) {
      const prompt = `
        You are an expert HR and Academic evaluator following the SFIA 9 and ACM Computing Curricula 2020 frameworks.
        Evaluate the following portfolio data and calculate a score from 0 to 100 for each of the 5 competencies:
        1. Academic (Based on theoretical knowledge and academic projects)
        2. Research (Based on data analysis, research roles, and academic papers)
        3. Work (Based on professional experience and internships)
        4. Organization (Based on leadership, teamwork, and organizational roles)
        5. Impact (Based on the scale, reach, and outcome of the projects/work)

        Here is the candidate's portfolio data:
        ${JSON.stringify(portfolioData)}

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
        
        // Clean markdown blocks if Gemini returns them
        const cleanedText = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        const rawScores = JSON.parse(cleanedText);
        
        // Make it case-insensitive
        const lowerCaseScores: any = {};
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
        ai_active = true; // [C-2] Successfully used AI
      } catch (mlError) {
        console.error("ML Evaluation Failed, falling back to heuristic:", mlError);
        newScores = calculateHeuristicScores(portfolioData);
      }
    } else {
      console.log("No GEMINI_API_KEY found, using heuristic ML simulation.");
      newScores = calculateHeuristicScores(portfolioData);
    }

    const sanitizeScore = (s: any) => Math.min(100, Math.max(0, parseInt(s) || 60));
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
      ai_active, // [C-2] Expose this to admin panel
      scores: finalScores
    });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred." }, { status: 500 });
  }
}

function calculateHeuristicScores(data: any): CompetencyScores {
  const projCount = data.projects.length;
  const expCount = data.experiences.length;
  
  let orgCount = 0;
  let workCount = 0;
  let researchCount = 0;

  data.experiences.forEach((exp: any) => {
    const role = (exp.role || "").toLowerCase();
    if (role.includes("staff") || role.includes("member") || role.includes("head") || role.includes("lead")) orgCount++;
    if (role.includes("research") || role.includes("data") || role.includes("analysis")) researchCount++;
    if (role.includes("engineer") || role.includes("developer") || role.includes("intern")) workCount++;
  });

  return {
    Academic: Math.min(100, 65 + (projCount * 2)),
    Research: Math.min(100, 60 + (researchCount * 5)),
    Work: Math.min(100, 65 + (workCount * 5) + expCount),
    Organization: Math.min(100, 65 + (orgCount * 4)),
    Impact: Math.min(100, 60 + (projCount * 3) + (expCount * 2)),
  };
}
