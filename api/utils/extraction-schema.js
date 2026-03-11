import { z } from 'zod';

const riskLevel = z.enum(['low', 'unclear', 'high']);

export const ExtractionSchema = z.object({
  population: z.object({
    description: z.string(),
    sampleSize: z.number().nullable(),
    ageRange: z.string().default(''),
    country: z.string().default(''),
  }),
  intervention: z.object({
    name: z.string(),
    dose: z.string().default(''),
    duration: z.string().default(''),
    route: z.string().default(''),
  }),
  comparator: z.object({
    name: z.string().default(''),
    dose: z.string().default(''),
    duration: z.string().default(''),
  }),
  outcomes: z.array(z.object({
    name: z.string(),
    type: z.enum(['primary', 'secondary', 'safety', 'other']),
    measure: z.string().default(''),
    effectSize: z.string().default(''),
    ci95: z.string().default(''),
    pValue: z.string().default(''),
  })),
  studyDesign: z.string(),
  riskOfBias: z.object({
    selection: riskLevel,
    performance: riskLevel,
    detection: riskLevel,
    attrition: riskLevel,
    reporting: riskLevel,
    overall: riskLevel,
  }),
  funding: z.string().default(''),
  conflicts: z.string().default(''),
  limitations: z.string().default(''),
});
