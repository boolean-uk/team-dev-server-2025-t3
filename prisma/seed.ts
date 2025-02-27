import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'
const prisma = new PrismaClient()

async function seed() {
  const course = await createCourse('Software Development')
  const module1 = await createModule(
    'User Interface with HTML & CSS',
    course.id
  )
  const unit1 = await createUnit('TDD', module1.id)
  await createExercise('Bobs bagels', unit1.id)
  await createExercise('Cohort manager challenge', unit1.id)
  const unit2 = await createUnit('Spotify', module1.id)
  await createExercise('Spotify challenge', unit2.id)
  await createExercise('Quotebook', unit2.id)
  const unit3 = await createUnit('Twitter', module1.id)
  await createExercise('Twitter challenge', unit3.id)
  await createExercise('Scientific paper', unit3.id)

  const cohort = await createCohort()

  prisma.cohort.update({
    where: { id: cohort.id },
    data: {
      courses: { set: [{ id: course.id }] }
    }
  })

  const student = await createUser(
    'student@test.com',
    'Testpassword1!',
    cohort.id,
    'Joe',
    'Bloggs',
    'Hello, world!',
    'student1'
  )
  const teacher = await createUser(
    'teacher@test.com',
    'Testpassword1!',
    null,
    'Rick',
    'Sanchez',
    'Hello there!',
    'teacher1',
    'TEACHER'
  )
  const simpleTeacher = await createUser(
    'string',
    'string',
    null,
    'Rick',
    'Sanchez',
    'Hello there!',
    'teacher1',
    'TEACHER'
  )

  await createPost(student.id, 'My first post!')
  await createPost(teacher.id, 'Hello, students')
  await createPost(simpleTeacher.id, 'Hello, students')
  process.exit(0)
}

async function createPost(userId: number, content: string) {
  const post = await prisma.post.create({
    data: {
      userId,
      content
    },
    include: {
      user: true
    }
  })

  console.info('Post created', post)

  return post
}

async function createCohort() {
  const cohort = await prisma.cohort.create({
    data: { name: 'test' }
  })

  console.info('Cohort created', cohort)

  return cohort
}

async function createUser(
  email: string,
  password: string,
  cohortId: number | null,
  firstName: string,
  lastName: string,
  bio: string,
  githubUrl: string,
  role: Role = 'STUDENT'
) {
  const user = await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 8),
      role,
      cohortId,
      profile: {
        create: {
          firstName,
          lastName,
          bio,
          githubUrl
        }
      }
    },
    include: {
      profile: true
    }
  })

  console.info(`${role} created`, user)

  return user
}

async function createCourse(name: string) {
  const course = await prisma.course.create({
    data: {
      name
    }
  })
  console.info('course created', course)
  return course
}

async function createModule(name: string, courseId: number) {
  const module = await prisma.module.create({
    data: {
      courseId,
      name
    }
  })
  console.info('module created', module)
  return module
}

async function createUnit(name: string, moduleId: number) {
  const unit = await prisma.unit.create({
    data: {
      moduleId,
      name
    }
  })
  console.info('unit created', unit)
  return unit
}

async function createExercise(name: string, unitId: number) {
  const exercise = await prisma.exercise.create({
    data: {
      unitId,
      name
    }
  })
  console.info('exercise created', exercise)
  return exercise
}

seed().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
