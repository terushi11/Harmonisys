import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QUESTIONS } from '@/constants';
import type { SubmissionData } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body: SubmissionData = await request.json();
        const { formData, responses } = body;

        // Validate required fields
        if (!formData.name || !formData.date || !formData.team) {
            return NextResponse.json(
                { error: 'Missing required fields: name, date, or team' },
                { status: 400 }
            );
        }

        // Validate that all questions are answered
        const answeredQuestions = Object.keys(responses).map(Number);
        const requiredQuestions = QUESTIONS.map((q) => q.id);
        const missingQuestions = requiredQuestions.filter(
            (id) => !answeredQuestions.includes(id)
        );

        if (missingQuestions.length > 0) {
            return NextResponse.json(
                {
                    error: `Missing responses for questions: ${missingQuestions.join(', ')}`,
                },
                { status: 400 }
            );
        }

        // Create submission with responses
        const submission = await prisma.submission.create({
            data: {
                name: formData.name,
                date: new Date(formData.date),
                team: formData.team,
                responses: {
                    create: Object.entries(responses).map(
                        ([questionId, selectedOption]) => {
                            const question = QUESTIONS.find(
                                (q) => q.id === Number.parseInt(questionId)
                            );
                            return {
                                questionId: Number.parseInt(questionId),
                                questionText: question?.text || '',
                                selectedOption,
                            };
                        }
                    ),
                },
            },
            include: {
                responses: true,
            },
        });

        return NextResponse.json({
            success: true,
            submissionId: submission.id,
            message: 'Questionnaire submitted successfully',
        });
    } catch (error) {
        console.error('Error submitting questionnaire:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const submissions = await prisma.submission.findMany({
            include: {
                responses: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ submissions });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
