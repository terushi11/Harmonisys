import { IRSdb } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

interface Location {
    id: string;
    locationCode: string;
    locationName: string;
    isActive: boolean;
    locationDescription: string;
}
export interface Event {
    id: string;
    eventName: string;
    eventDescription: string;
    factSheet: string;
    status: string;
    eventStarted: boolean;
    eventDate: Date;
    scenarioID: string;
    locationID: string;
    categoryID: string;
    incidentCommanderID: string;
    liaisonOfficerID: string;
    publicInformationOfficerID: string;
    safetySecurityOfficerID: string;
    location: Location;
}

export async function GET() {
    try {
        const eventsRef = collection(IRSdb, 'events');
        const snapshot = await getDocs(eventsRef);

        if (snapshot.empty) {
            return NextResponse.json(
                { message: 'No events found', data: null },
                { status: 200 }
            );
        }

        const events = await Promise.all(
            snapshot.docs.map(async (eventDoc) => {
                const eventData = eventDoc.data();
                let category;
                let location;
                let scenario;

                if (eventData['categoryID']) {
                    const categoryRef = collection(IRSdb, 'event-categories');
                    const categorySnapshot = await getDocs(categoryRef);

                    if (!categorySnapshot.empty) {
                        category = {
                            id: categorySnapshot.docs.at(0)?.id,
                            ...categorySnapshot.docs.at(0)?.data(),
                        };
                    }
                }

                if (eventData['locationID']) {
                    const locationRef = collection(IRSdb, 'event-locations');
                    const locationSnapshot = await getDocs(locationRef);

                    if (!locationSnapshot.empty) {
                        location = {
                            id: locationSnapshot.docs.at(0)?.id,
                            ...locationSnapshot.docs.at(0)?.data(),
                        };
                    }
                }

                if (eventData['scenarioID']) {
                    const scenarioRef = collection(IRSdb, 'event-scenarios');
                    const scenarioSnapshot = await getDocs(scenarioRef);

                    if (!scenarioSnapshot.empty) {
                        scenario = {
                            id: scenarioSnapshot.docs.at(0)?.id,
                            ...scenarioSnapshot.docs.at(0)?.data(),
                        };
                    }
                }

                const data = {
                    ...eventData,
                    category,
                    location,
                    scenario,
                };

                return {
                    id: eventDoc.id,
                    ...data,
                };
            })
        );

        return NextResponse.json(
            { message: 'Ok', data: events },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json(
            { message: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}
