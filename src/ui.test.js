import request from "sync-request-curl"
const GROUP = "";

const URL = `1531-24t3-${GROUP.split("_")[0]}-${GROUP.split("_")[1]}.vercel.app`;

const requestHelper = (method, route, content) => {
    const options = {};
    if (["POST", "PUT"].includes(method)) {
        options.json = content;
    } else {
        options.qs = content;
    }

    const newRoute = `http://${URL}${route}`;
    // console.log(newRoute)
    const res = request(method, newRoute, options);
    if ([200, 400, 401, 403, 404].includes(res.statusCode)) {
        return unwrap(JSON.parse(res.body));
    } else {
        return unwrap({ error: `status: ${res.statusCode}, ${res.body}`})
    }
}

const unwrap = (response) => {
    if (response && typeof response === 'object' && Object.keys(response).length === 1) {
        const ret = Object.values(response)[0];
        // console.log(ret);
      return ret;
    }
    return { ...response };
  }

const register = (email, password, nameFirst, nameLast) => requestHelper("POST", "/v1/admin/auth/register", { email, password, nameFirst, nameLast });
const createQuiz = (token, name, description) => requestHelper("POST", "/v1/admin/quiz", { token, name, description });
const createQuestion = (token, quizId, questionBody) => requestHelper("POST", `/v1/admin/quiz/${quizId}/question`, { token, questionBody });

const getUserInfo = (token) => requestHelper("GET", "/v1/admin/user/details", { token });
const getQuizInfo = (token, quizId) => requestHelper("GET", `/v1/admin/quiz/${quizId}`, { token });

const clear = () => requestHelper("DELETE", "/v1/clear");

describe("UI test", () => {
    test("test1", () => {
        clear();            
        const token = register("hayden@email.com", "password123", "Hayden", "Smith");
        const userInfo = getUserInfo(token);
        expect(userInfo).toStrictEqual({
            userId: expect.any(Number),
            name: 'Hayden Smith',
            email: 'hayden@email.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
        });

        const quizId = createQuiz(token, "quiz1", "quiz description");
        const quizInfo = getQuizInfo(token, quizId);
        expect(quizInfo).toStrictEqual({  
            quizId: expect.any(Number),
            name: 'quiz1',
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: 'quiz description',
            numQuestions: 0,
            questions: [],
            timeLimit: 0 
        });

        const qn1 = createQuestion(token, quizId, {
            question: "What is the capital of France?",
            duration: 30,
            points: 5,
            answerOptions: [
              {"answer": "Paris", "correct": true},
              {"answer": "London", "correct": false},
              {"answer": "Berlin", "correct": false},
              {"answer": "Madrid", "correct": false}
            ],
            thumbnailUrl: "http://example.com/image.jpg"
        });
        
        const qn2 = createQuestion(token, quizId, {
            question: "What is the capital of France?",
            duration: 30,
            points: 5,
            answerOptions: [
              {"answer": "Paris", "correct": false},
              {"answer": "London", "correct": true},
              {"answer": "Berlin", "correct": false},
              {"answer": "Madrid", "correct": false}
            ],
            thumbnailUrl: "http://example.com/image.jpg"
        });
        
    })
})