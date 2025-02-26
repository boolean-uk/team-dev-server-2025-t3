import { sendDataResponse } from '../utils/responses.js'

export const create = async (req, res) => {
  const { date, cohort_id: cohortId, lines } = req.body

  return sendDataResponse(res, 201, {
    log: {
      id: 1,
      cohort_id: cohortId,
      date,
      author: {
        id: req.user.id,
        first_name: req.user.firstName,
        last_name: req.user.lastName
      },
      lines: lines.map((line, index) => {
        return {
          id: index + 1,
          content: line.content
        }
      })
    }
  })
}
