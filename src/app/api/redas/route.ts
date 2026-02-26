import { NextResponse } from 'next/server';

const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sheetName = searchParams.get('sheetName');
    const label = searchParams.get('label');
    const place = searchParams.get('place');
    const count = searchParams.get('count');

    if (!sheetName) {
        return NextResponse.json(
            { error: 'Missing sheetName parameter' },
            { status: 400 }
        );
    }

    // Only require label for Trainings, not EDM Trainings
    if (sheetName === 'Trainings' && !label) {
        return NextResponse.json(
            { error: 'Missing label parameter' },
            { status: 400 }
        );
    }

    const encodedSheetName = encodeURIComponent(sheetName);
    let url = `${GOOGLE_APPS_SCRIPT_URL}?sheetName=${encodedSheetName}`;

    if (sheetName === 'Trainings') {
        const encodedLabel = encodeURIComponent(label!);
        url += `&label=${encodedLabel}`;
        if (place) {
            const encodedPlace = encodeURIComponent(place);
            url += `&place=${encodedPlace}`;
        }
        if (count === 'true') {
            url += `&count=true`;
        }
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}
