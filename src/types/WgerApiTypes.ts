import type { paths } from './wgerSchema';

type ExerciseInfo =
  paths['/api/v2/exerciseinfo/{id}/']['get']['responses'][200]['content']['application/json'];

type ExerciseInfoList =
  paths['/api/v2/exerciseinfo/']['get']['responses'][200]['content']['application/json'];

type Muscle = paths['/api/v2/muscle/{id}/']['get']['responses'][200]['content']['application/json'];

type Equipment =
  paths['/api/v2/equipment/{id}/']['get']['responses'][200]['content']['application/json'];

type ExerciseImage =
  paths['/api/v2/exerciseimage/{id}/']['get']['responses'][200]['content']['application/json'];
