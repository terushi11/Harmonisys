-- CreateTable
CREATE TABLE "PlaceCoordinate" (
    "id" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PlaceCoordinate_pkey" PRIMARY KEY ("id")
);
