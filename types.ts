import { z } from 'zod';

const characterSchema = z.object({
  id: z.string().readonly(),
  name: z.string().optional(),
  age_range: z.string().min(1, "Age range is required"),
  look: z.string().min(1, "Look description is required"),
  outfit_notes: z.string().optional(),
});

const locationSchema = z.object({
  id: z.string().readonly(),
  name: z.string().min(1, "Location name is required"),
  lighting: z.string().optional(),
  notes: z.string().optional(),
});

const shotSchema = z.object({
  type: z.string().min(1, "Shot type is required"),
  camera: z.string().optional(),
  action: z.string().min(1, "Action is required"),
  visual_style: z.string().optional(),
  audio: z.object({
    music: z.string().optional(),
    sfx: z.array(z.string()).optional(),
  }).optional(),
  overlay_text: z.string().optional(),
  notes: z.string().optional(),
});

const dialogSchema = z.object({
  character_id: z.string().min(1, "Character ID is required"),
  mode: z.enum(['dialog', 'vo']),
  line: z.string().min(1, "Dialog line is required"),
});

const sceneSchema = z.object({
  id: z.string().readonly(),
  title: z.string().optional(),
  duration_sec: z.number().min(0, "Duration must be positive"),
  location_id: z.string().min(1, "Location is required"),
  ratio: z.string(), // Validation is handled at the top level
  shots: z.array(shotSchema).min(1, "At least one shot is required per scene"),
  dialog: z.array(dialogSchema).min(1, "At least one dialog/VO line is required per scene"),
  use_vo: z.boolean().default(false),
  hooks: z.array(z.string()).optional(),
});

export const storyboardSchema = z.object({
  model: z.enum(['veo-2', 'veo-3']),
  metadata: z.object({
    project_title: z.string().min(1, "Project title is required"),
    language: z.enum(['id', 'en']),
    aspect_ratio: z.string(), // Validation is handled at the top level
    total_duration_sec: z.number().min(1, "Target duration must be at least 1 second"),
    brand: z.object({
      tagline: z.string().optional(),
      tone: z.array(z.string()).optional(),
    }),
  }),
  characters: z.array(characterSchema).min(1, "At least one character is required"),
  locations: z.array(locationSchema).min(1, "At least one location is required"),
  brand_assets: z.array(z.string()).optional(),
  global_prompt: z.string().optional(),
  aida: z.object({
    enabled: z.boolean().default(false),
    mapping: z.record(z.string(), z.string()).optional(), // e.g., { s1: "ATTENTION" }
  }).optional(),
  scenes: z.array(sceneSchema).min(1, "At least one scene is required"),
  seed: z.number().nullable().optional(),
  variations: z.number().min(0).max(3).optional(),
}).superRefine((data, ctx) => {
  // Aspect ratio validation
  if (data.model === 'veo-2') {
    if (data.metadata.aspect_ratio !== '9:16') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['metadata.aspect_ratio'],
        message: 'Veo-2 only supports 9:16 aspect ratio.',
      });
    }
    data.scenes.forEach((scene, index) => {
      if (scene.ratio !== '9:16' && scene.ratio !== 'inherit') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`scenes.${index}.ratio`],
          message: 'Veo-2 scenes must inherit or be 9:16.',
        });
      }
    });
  }

  // Check if dialog character_id and scene location_id exist
  const characterIds = new Set(data.characters.map(c => c.id));
  const locationIds = new Set(data.locations.map(l => l.id));

  data.scenes.forEach((scene, sceneIndex) => {
    if (!locationIds.has(scene.location_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [`scenes.${sceneIndex}.location_id`],
        message: `Location ID "${scene.location_id}" does not exist.`,
      });
    }
    scene.dialog.forEach((d, dialogIndex) => {
      if (!characterIds.has(d.character_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`scenes.${sceneIndex}.dialog.${dialogIndex}.character_id`],
          message: `Character ID "${d.character_id}" does not exist.`,
        });
      }
    });
  });
});


export type StoryboardSchema = z.infer<typeof storyboardSchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type Shot = z.infer<typeof shotSchema>;
export type Dialog = z.infer<typeof dialogSchema>;
export type Character = z.infer<typeof characterSchema>;
export type Location = z.infer<typeof locationSchema>;

export const initialData: StoryboardSchema = {
  model: 'veo-2',
  metadata: {
    project_title: 'Hair Powder Ad',
    language: 'id',
    aspect_ratio: '9:16',
    total_duration_sec: 16,
    brand: {
      tagline: 'Instant Freshness, Maximum Volume.',
      tone: ['Energetic', 'Comedy'],
    },
  },
  global_prompt: 'A short, punchy ad for a new hair powder product targeting young men in Indonesia.',
  characters: [
    { id: 'c1', name: 'Rio', age_range: '20-25', look: 'Indonesian male, casual style, stylish hair.', outfit_notes: 'Consistent white t-shirt + denim jacket.' },
  ],
  locations: [
    { id: 'l1', name: 'Bedroom', lighting: 'Natural morning light through a window.', notes: 'Clean, minimalist style bedroom.' },
    { id: 'l2', name: 'Sidewalk Cafe', lighting: 'Golden hour, late afternoon.', notes: 'Busy urban sidewalk with cafe seating.' },
  ],
  brand_assets: ['Product bottle with blue label'],
  aida: {
    enabled: true,
    mapping: { s1: 'ATTENTION', s2: 'ACTION' },
  },
  scenes: [
    {
      id: 's1',
      title: 'The Transformation',
      duration_sec: 8,
      location_id: 'l1',
      ratio: 'inherit',
      use_vo: false,
      shots: [
        { type: 'close-up', action: 'Rio applies hair powder to his flat hair.', camera: 'Slightly slow-motion.' },
        { type: 'medium', action: 'He styles his hair, which now has incredible volume. He smiles confidently at his reflection.', camera: 'Push-in on his happy face.' },
      ],
      dialog: [
        { character_id: 'c1', mode: 'vo', line: 'Rambut lepek? Nggak lagi.' },
      ],
      hooks: ['Negative', 'Contradiction'],
    },
    {
      id: 's2',
      title: 'The Result',
      duration_sec: 8,
      location_id: 'l2',
      ratio: 'inherit',
      use_vo: false,
      shots: [
        { type: 'wide', action: 'Rio walks confidently down the street, turning heads.', camera: 'Tracking shot.' },
        { type: 'close-up', action: 'He holds up the product to the camera with a wink.', camera: 'Whip pan to product.' },
      ],
      dialog: [
        { character_id: 'c1', mode: 'vo', line: 'Dapetin volume maksimal, sekarang juga!' },
      ],
      hooks: ['CTA'],
    },
  ],
};