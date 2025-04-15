import { MergeUnion } from '../../types';

type ModuleConfName<AppCore> = keyof AppCore;

type ModuleConfUnion<AppCore> = AppCore[ModuleConfName<AppCore>];

export type AppConf<AppCore> = MergeUnion<ModuleConfUnion<AppCore>>;
