export type Role = 'ADMIN' | 'NM' | 'PARTICIPANT' | 'JUDGE';

export interface User {
    id: string;
    email: string;
    role: Role;
    countryCode: string;
    name?: string;
}

export interface Competition {
    id: string;
    name: string;
    type: 'INDIVIDUAL' | 'TEAM';
    status: 'DRAFT' | 'OPEN' | 'JUDGING' | 'CLOSED';
    config: {
        themes?: string[];
        deadline?: string;
        categories?: string[];
    };
}

export interface ExifData {
    cameraMake?: string;
    cameraModel?: string;
    lens?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    focalLength?: string;
    capturedAt?: string;
}

export interface Submission {
    id: string;
    userId: string;
    competitionId: string;
    fileUrl: string;
    thumbnailUrl: string;
    title: string;
    description: string;
    story?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    exif?: ExifData;
    createdAt: string;
}

export interface Score {
    submissionId: string;
    judgeId: string;
    creativity: number;
    technical: number;
    thematic: number;
    emotional: number;
}
