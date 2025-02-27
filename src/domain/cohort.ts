import dbClient from '../utils/dbClient.ts'

/**
 * Create a new Cohort in the database
 */
export async function createCohort(name: string) {
  const createdCohort = await dbClient.cohort.create({
    data: {
      name
    },
  })

  return new Cohort(createdCohort.id, name)
}

export class Cohort {
  public id: number | null
  public name: string

  constructor(id: number | null = null, name: string) {
    this.id = id
    this.name = name
  }
}
