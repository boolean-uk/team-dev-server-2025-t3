-- CreateTable
CREATE TABLE "_CohortToCourse" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CohortToCourse_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CohortToCourse_B_index" ON "_CohortToCourse"("B");

-- AddForeignKey
ALTER TABLE "_CohortToCourse" ADD CONSTRAINT "_CohortToCourse_A_fkey" FOREIGN KEY ("A") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CohortToCourse" ADD CONSTRAINT "_CohortToCourse_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
