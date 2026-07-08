export interface SpecFormula {
  id: string;
  name: string;
  expression: string;
  unit: string;
}

export interface SpecCheckpoint {
  id: string;
  category: string;    // e.g. "품질", "안전", "시공"
  item: string;        // e.g. "슬럼프 허용 오차"
  criteria: string;    // e.g. "슬럼프 100mm 이상일 때 허용차 ±25mm"
  testMethod?: string; // e.g. "KS F 2402"
}

export interface SpecNode {
  code: string;            // e.g. "KCS 14 20 10"
  title: string;           // e.g. "일반콘크리트 시공기준"
  type: 'KCS' | 'KDS' | 'KS' | 'LAW' | 'GUIDE';
  revisionDate: string;    // "YYYY-MM-DD"
  originalUrl: string;     // Target link on KCSC
  keywords: string[];      // Indexing keywords
  checkpoints: SpecCheckpoint[];
  formulas?: SpecFormula[];
  relatedApps: {
    appId: string;
    tabName?: string;
  }[];
  relations: {
    parentCode?: string;
    dependencies: string[];
    referencedKS: string[];
  };
}

export interface SpecIndexItem {
  code: string;
  title: string;
  type: string;
  keywords: string[];
}
