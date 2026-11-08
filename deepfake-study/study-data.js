/**
 * Deepfake Image Detection Training Study
 * Research Configuration & Dataset Definition
 * 
 * NOTE FOR RESEARCHER:
 * You can easily drop your own images into the `assets/images/` folder
 * and update the `src` paths below, or adjust the groundTruth labels.
 */

const STUDY_CONFIG = {
  studyTitle: "Visual Media Authenticity Study",
  institution: "Perception & AI Cognitive Research Lab",
  researcherPasscode: "researcher2026", // Passcode to view Answer Key & Research Dashboard
  googleSheetWebhookUrl: "https://script.google.com/macros/s/AKfycbx-Acp0e_JN6NeQSrJup9xHSrS9CUH1p90Bvu8a3MP2cW5Mo8DEk9UuoXbwlkKuuLX-/exec",
  
  // Demographics options
  ageRanges: [
    "Prefer not to say",
    "18 – 24",
    "25 – 34",
    "35 – 44",
    "45 – 54",
    "55 – 64",
    "65+"
  ],

  familiarityLevels: [
    { value: "beginner", label: "Beginner", description: "I rarely think about or encounter deepfakes." },
    { value: "somewhat", label: "Somewhat familiar", description: "I know what deepfakes are and occasionally see them online." },
    { value: "very", label: "Very familiar", description: "I actively follow AI, frequently evaluate, or work with generated media." }
  ],

  /**
   * Balanced Image Sets:
   * Both Set A and Set B have exactly 5 images:
   * - 2 Authentic Photographs (REAL)
   * - 3 AI-Generated Images (AI-GENERATED)
   * Matched difficulty & category types across sets for experimental parity.
   */
  imageSets: {
    // IMAGE SET A (5 images)
    setA: [
      {
        id: "img_a1",
        label: "Set A - Image 1",
        category: "Human Portrait",
        src: "assets/images/setA/set_a1.jpg",
        placeholderTitle: "Set A • Image 1",
        placeholderSubtitle: "Set A image 1",
        groundTruth: "REAL",
        difficulty: "Medium",
        forensicNotes: "Authentic portrait. Iris catchlights match ambient light; ear cartilage anatomy is anatomically coherent; fine natural skin pores."
      },
      {
        id: "img_a2",
        label: "Set A - Image 2",
        category: "Visual Assessment",
        src: "assets/images/setA/set_a2.jpg",
        placeholderTitle: "Set A • Image 2",
        placeholderSubtitle: "Set A image 2",
        groundTruth: "AI-GENERATED",
        difficulty: "Medium-Hard",
        forensicNotes: "AI-Generated face. Strands of hair dissolve indistinctly into the background; asymmetric pupil contour under close inspection."
      },
      {
        id: "img_a3",
        label: "Set A - Image 3",
        category: "Visual Assessment",
        src: "assets/images/setA/set_a3.jpg",
        placeholderTitle: "Set A • Image 3",
        placeholderSubtitle: "Set A image 3",
        groundTruth: "REAL",
        difficulty: "Easy-Medium",
        forensicNotes: "Authentic photograph. Legible commercial signage, realistic perspective depth, natural optical lens depth-of-field."
      },
      {
        id: "img_a4",
        label: "Set A - Image 4",
        category: "Visual Assessment",
        src: "assets/images/setA/set_a4.jpg",
        placeholderTitle: "Set A • Image 4",
        placeholderSubtitle: "Set A image 4",
        groundTruth: "AI-GENERATED",
        difficulty: "Medium",
        forensicNotes: "AI-Generated scene. Non-Euclidean tile geometry; staircase banister merges irregularly into the support pillar."
      },
      {
        id: "img_a5",
        label: "Set A - Image 5",
        category: "Visual Assessment",
        src: "assets/images/setA/set_a5.jpg",
        placeholderTitle: "Set A • Image 5",
        placeholderSubtitle: "Set A image 5",
        groundTruth: "AI-GENERATED",
        difficulty: "Easy-Medium",
        forensicNotes: "AI-Generated hands. Irregular knuckle spacing; fingernail texture lacks natural cuticles; cup rim exhibits wavy curvature."
      }
    ],

    // IMAGE SET B (5 images)
    setB: [
      {
        id: "img_b1",
        label: "Set B - Image 1",
        category: "Visual Assessment",
        src: "assets/images/setB/set_b1.jpg",
        placeholderTitle: "Set B • Image 1",
        placeholderSubtitle: "Set B image 1",
        groundTruth: "REAL",
        difficulty: "Medium",
        forensicNotes: "Authentic portrait. Natural earring piercing and earlobe structure; authentic dental anatomy with organic alignment."
      },
      {
        id: "img_b2",
        label: "Set B - Image 2",
        category: "Visual Assessment",
        src: "assets/images/setB/set_b2.jpg",
        placeholderTitle: "Set B • Image 2",
        placeholderSubtitle: "Set B image 2",
        groundTruth: "AI-GENERATED",
        difficulty: "Medium-Hard",
        forensicNotes: "AI-Generated portrait. Earring design does not match between ears; collar fabric merges indistinctly into skin; overly porcelain skin."
      },
      {
        id: "img_b3",
        label: "Set B - Image 3",
        category: "Visual Assessment",
        src: "assets/images/setB/setb3.jpg",
        placeholderTitle: "Set B • Image 3",
        placeholderSubtitle: "Set B image 3",
        groundTruth: "REAL",
        difficulty: "Easy-Medium",
        forensicNotes: "Authentic photograph. Coherent handwriting and legible words; consistent shadow angles from outdoor sunlight."
      },
      {
        id: "img_b4",
        label: "Set B - Image 4",
        category: "Visual Assessment",
        src: "assets/images/setB/set_b4.jpg",
        placeholderTitle: "Set B • Image 4",
        placeholderSubtitle: "Set B image 4",
        groundTruth: "AI-GENERATED",
        difficulty: "Medium",
        forensicNotes: "AI-Generated cityscape. Neon signs show nonsensical alien glyphs/pseudotext; puddle reflections do not match building lights."
      },
      {
        id: "img_b5",
        label: "Set B - Image 5",
        category: "Visual Assessment",
        src: "assets/images/setB/set_b5.jpg",
        placeholderTitle: "Set B • Image 5",
        placeholderSubtitle: "Set B image 5",
        groundTruth: "AI-GENERATED",
        difficulty: "Easy-Medium",
        forensicNotes: "AI-Generated group interaction. Hand resting on shoulder exhibits unnatural finger count / fused knuckle joint."
      }
    ]
  },

  /**
   * Training Session Modules
   * Organized into comprehensive, beginner-friendly educational cards
   */
  trainingModules: [
    {
      id: "mod_intro",
      stepNumber: 1,
      badge: "Core Foundations",
      title: "What Are Deepfakes & AI-Generated Images?",
      summary: "Understanding the distinction between real photography and synthetic generation.",
      sections: [
        {
          heading: "Definitions and Terminology",
          content: "A <strong>deepfake</strong> refers to synthetic media in which a person's likeness, face, or voice has been replaced or synthesized using deep learning algorithms. More broadly, <strong>AI-generated images</strong> are complete visuals generated from scratch based on text descriptions using generative models like Stable Diffusion, Midjourney, DALL-E, and FLUX."
        },
        {
          heading: "How AI Creates These Images",
          content: "Unlike a camera capturing real light bouncing off physical objects, generative AI models (such as <em>latent diffusion models</em>) begin with random visual static (noise) and iteratively refine it thousands of times to match statistical patterns learned from millions of training images. The AI does not 'understand' physical anatomy, optics, or 3D space—it only predicts what pixels statistically belong together."
        }
      ],
      keyTakeaways: [
        "AI generates images by guessing pixel patterns, not by capturing real physical light.",
        "Because AI lacks 3D physical comprehension, it frequently makes subtle physical and spatial errors."
      ]
    },
    {
      id: "mod_anatomy",
      stepNumber: 2,
      badge: "Facial & Anatomical",
      title: "Facial & Anatomical Irregularities",
      summary: "How to spot unnatural anomalies in human features, eyes, teeth, and hands.",
      sections: [
        {
          heading: "1. Hands and Fingers",
          content: "Hands remain a major vulnerability for generative models. Look for: extra or missing fingers, irregular knuckle joints, fingers bending at impossible angles, or digits that unnaturally fuse together into objects."
        },
        {
          heading: "2. Eyes and Pupils",
          content: "In genuine photography, pupils are circular and reflections (catchlights) in both eyes match the surrounding light sources. In AI images, pupils may be slightly oblong, notched, or have completely mismatched reflections."
        },
        {
          heading: "3. Ears, Teeth, and Accessories",
          content: "Check earlobe cartilage for symmetrical anatomy. Examine earrings: AI frequently creates mismatched jewelry or earrings that fade directly into skin. Teeth in AI images often appear as a continuous white bar or have unnatural spacing without individual gum lines."
        },
        {
          heading: "4. Hair Boundaries",
          content: "Individual strands of hair in AI images often blur abruptly into the background, merge into collars, or look like painted wisps rather than separate physical strands."
        }
      ],
      keyTakeaways: [
        "Always zoom in on extremities: hands, ears, teeth, and pupils.",
        "Check for symmetry in bilateral items (earrings, eyeglass frames, cufflinks)."
      ]
    },
    {
      id: "mod_background",
      stepNumber: 3,
      badge: "Environment & Objects",
      title: "Background & Object Inconsistencies",
      summary: "Evaluating background architecture, text, and environmental coherence.",
      sections: [
        {
          heading: "1. Text and Signage ('Pseudotext')",
          content: "AI models struggle with spelling and coherent typography. Street signs, book titles, storefronts, and brand logos in AI images frequently display alien-like gibberish, warped letterforms, or impossible mixed alphabets."
        },
        {
          heading: "2. Perspective and Geometry",
          content: "Look at straight architectural lines: window frames, door arches, tiled floors, and staircases. In synthetic images, structural lines often waver, staircases lead into solid walls, or horizon lines break unnaturally behind subjects."
        },
        {
          heading: "3. Background Crowds and Peripheral Objects",
          content: "While the central subject may appear convincing, AI generators often cut corners on background bystanders. Peripheral people often feature distorted faces, missing limbs, or melted features."
        }
      ],
      keyTakeaways: [
        "Examine text in the background: if words are garbled or pseudo-letters, it is almost certainly AI.",
        "Inspect background geometry: look for staircases, tiles, or lines that defy physical laws."
      ]
    },
    {
      id: "mod_lighting",
      stepNumber: 4,
      badge: "Physics & Optics",
      title: "Lighting, Shadows & Reflections",
      summary: "Identifying optical impossibilities that break the laws of physics.",
      sections: [
        {
          heading: "1. Shadow Direction & Consistency",
          content: "In natural photography, all cast shadows align with the primary light source (e.g., the sun or a studio lamp). AI often renders shadows pointing in conflicting directions, or creates a strong light highlight on an object with no corresponding cast shadow."
        },
        {
          heading: "2. Surface Reflections",
          content: "Inspect mirrors, wet asphalt, glass windows, and metallic surfaces. AI reflections frequently display objects that aren't present in the foreground, or fail to mirror the subject correctly."
        },
        {
          heading: "3. Contact Shadows",
          content: "When an object or person rests on a surface (a cup on a table, feet on the ground), there must be a dark 'ambient occlusion' contact shadow. AI objects often appear to float slightly above surfaces."
        }
      ],
      keyTakeaways: [
        "Trace the light source: do all highlights and shadows point in the same direction?",
        "Check reflections on glass and water to confirm they mirror the actual scene."
      ]
    },
    {
      id: "mod_limitations",
      stepNumber: 5,
      badge: "Critical Thinking",
      title: "Why Visual Inspection Alone Is Not Always Enough",
      summary: "Understanding the evolving capabilities of generative AI and human cognitive biases.",
      sections: [
        {
          heading: "Rapid Model Evolution",
          content: "State-of-the-art models (like Midjourney v6 and FLUX) have significantly improved at generating realistic hands, readable text, and accurate lighting. Relying on simple 'six fingers' rules will produce false negatives."
        },
        {
          heading: "Compression & Social Media Noise",
          content: "When images are uploaded to platforms like X, WhatsApp, or Instagram, aggressive compression creates artifacts (blurring, JPEG blocking) that can hide AI flaws or make real photographs look artificial."
        },
        {
          heading: "The 'Liar's Dividend' and False Positives",
          content: "Overconfidence can lead people to accuse authentic news photos of being AI-generated simply because they feature unusual lighting or digital lens processing."
        }
      ],
      keyTakeaways: [
        "Generative AI improves monthly; visual heuristics must be continually updated.",
        "Real photos also have lens distortions and compression; avoid assuming any imperfection is AI."
      ]
    },
    {
      id: "mod_checklist",
      stepNumber: 6,
      badge: "Action Guide",
      title: "The 5-Step Practical Evaluation Checklist",
      summary: "A reliable forensic workflow for evaluating any suspicious image.",
      sections: [
        {
          heading: "Step 1: Inspect the Periphery",
          content: "Don't just look at the face or center. Zoom in on corners, background bystanders, and structural edges."
        },
        {
          heading: "Step 2: Scrutinize Anatomical Extremities",
          content: "Check fingers, knuckles, earlobe attachments, pupil shapes, and hair roots."
        },
        {
          heading: "Step 3: Read Any Visible Text",
          content: "Search for signs, t-shirt prints, labels, and license plates. Look for coherent spelling."
        },
        {
          heading: "Step 4: Check Lighting and Reflections",
          content: "Verify whether shadows match light directions and whether reflections in eyes or mirrors correspond to the scene."
        },
        {
          heading: "Step 5: Verify Provenance & Context",
          content: "Perform a reverse image search. Check whether credible journalistic outlets corroborate the image, and look for C2PA provenance credentials if available."
        }
      ],
      keyTakeaways: [
        "Follow a systematic routine rather than relying on a quick glance.",
        "Combine visual inspection with contextual verification whenever possible."
      ]
    }
  ]
};
