import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function seed() {
  try {
    const cohort = await createCohort()

    const student = await createUser({
      email: 'student@test.com',
      password: 'Testpassword1!',
      cohortId: cohort.id,
      firstName: 'Joe',
      lastName: 'Bloggs',
      bio: 'Hello, world!',
      githubUrl: 'student1',
      githubUsername: 'studentGithub',
      mobile: '1234567890',
      role: 'STUDENT',
      specialism: 'Frontend Development',
      cohortName: 'Cohort 1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    })

    const teacher = await createUser({
      email: 'teacher@test.com',
      password: 'Testpassword1!',
      cohortId: null,
      firstName: 'Rick',
      lastName: 'Sanchez',
      bio: 'Hello there!',
      githubUrl: 'teacher1',
      githubUsername: 'teacherGithub',
      mobile: '9876543210',
      role: 'TEACHER',
      specialism: 'Backend Development',
      cohortName: null,
      startDate: null,
      endDate: null
    })

    await createPost(student.id, 'My first post!')
    await createPost(teacher.id, 'Hello, students')

    console.info('Seeding complete!')
  } catch (error) {
    console.error('Error during seeding:', error)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
}

// Create a post for a user
async function createPost(userId, content) {
  const post = await prisma.post.create({
    data: { userId, content }
  })

  console.info('Post created:', post)
  return post
}

// Create a new cohort
async function createCohort() {
  const cohort = await prisma.cohort.create({ data: {} })
  console.info('Cohort created:', cohort)
  return cohort
}

// Create a user with a profile
async function createUser({
  email,
  password,
  cohortId,
  firstName,
  lastName,
  bio,
  githubUrl,
  githubUsername,
  mobile,
  role,
  specialism,
  cohortName,
  startDate,
  endDate
}) {
  const hashedPassword = await bcrypt.hash(password, 8)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      cohortId,
      profile: {
        create: {
          firstName,
          lastName,
          bio,
          githubUrl,
          githubUsername,
          mobile,
          role,
          specialism,
          cohort: cohortName,
          startDate,
          endDate
        }
      }
    },
    include: { profile: true }
  })

  console.info(`${role} created:`, user)
  return user
}

seed().catch(async (error) => {
  console.error('Seeding failed:', error)
  await prisma.$disconnect()
  process.exit(1)
})
