import type { paths } from './wgerSchema';

export type ExerciseInfo =
  paths['/api/v2/exerciseinfo/{id}/']['get']['responses'][200]['content']['application/json'];

export type ExerciseInfoList =
  paths['/api/v2/exerciseinfo/']['get']['responses'][200]['content']['application/json'];

export type Muscle =
  paths['/api/v2/muscle/{id}/']['get']['responses'][200]['content']['application/json'];

export type Equipment =
  paths['/api/v2/equipment/{id}/']['get']['responses'][200]['content']['application/json'];

export type ExerciseImage =
  paths['/api/v2/exerciseimage/{id}/']['get']['responses'][200]['content']['application/json'];

export type ExerciseSuggestion =
  paths['/api/v2/exercise/search/']['get']['responses'][200]['content']['application/json'];
