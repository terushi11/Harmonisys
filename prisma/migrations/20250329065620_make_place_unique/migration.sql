/*
  Warnings:

  - A unique constraint covering the columns `[place]` on the table `PlaceCoordinate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PlaceCoordinate_place_key" ON "PlaceCoordinate"("place");
