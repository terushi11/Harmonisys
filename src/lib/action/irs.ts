import { Incident } from '@prisma/client';

// Utility function to convert API response dates back to Date objects
export function parseIncidentDates(
    incident: Omit<Incident, 'date' | 'createdAt' | 'updatedAt'> & {
        date: string;
        createdAt: string;
        updatedAt: string;
    }
): Incident {
    return {
        ...incident,
        date: new Date(incident.date),
        createdAt: new Date(incident.createdAt),
        updatedAt: new Date(incident.updatedAt),
    };
}
