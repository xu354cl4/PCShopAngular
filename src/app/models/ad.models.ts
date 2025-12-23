export interface AdDto {
  adId: number;
  title: string;
  mediaUrl: string;
  linkUrl?: string;
  positionCode: string;
  positionName?: string;
  size?: string;
}

export interface PositionDto {
  positionID: number;
  code: string;
  name?: string;
  size?: string;
  isActive?: boolean;
}

export interface AdUpsertDto {
  adId?: number;          // undefined = 新增
  title: string;
  mediaUrl: string;
  linkUrl?: string;
  positionID?: number;
  startTime?: string;
  endTime?: string;
  status: boolean;
}
