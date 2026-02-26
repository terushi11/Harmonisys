import { MISALUDdb } from '@/lib/firebase';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const snapshot = await MISALUDdb.collection('screenings').get();

        if (snapshot.empty) {
            return NextResponse.json(
                { message: 'No screenings found', data: null },
                { status: 200 }
            );
        }

        const screenings = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json(
            { message: 'Ok', data: screenings },
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
