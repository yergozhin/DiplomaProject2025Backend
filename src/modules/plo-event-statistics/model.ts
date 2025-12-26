export interface PloEventStatistics {
  id: string;
  ploId: string;
  totalEvents: number;
  completedEvents: number;
  totalFightsOrganized: number;
  statisticsDate: string;
}

export interface CreateStatisticsFields {
  ploId: string;
  totalEvents?: number;
  completedEvents?: number;
  totalFightsOrganized?: number;
  statisticsDate: string;
}

export interface UpdateStatisticsFields {
  totalEvents?: number;
  completedEvents?: number;
  totalFightsOrganized?: number;
  statisticsDate?: string;
}

