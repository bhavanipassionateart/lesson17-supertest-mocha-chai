// Importing libraries - can also use require
import supertest from "supertest"; // importing an object
import { expect } from "chai"; // {} meants that we are importing a function
import dotenv from 'dotenv';
import { createRandomUser } from "../helpers/user_helper";
// Configuration
dotenv.config();
// Request - create a request object
const request = supertest('https://gorest.co.in/public-api/');
const token = process.env.USER_TOKEN;
// Mocha test cases
describe('/users route', () => {
    let userId = null;
    it('GET /users', async () => {
        const res = await request.get('users');
        //console.log(res.body.data);
        expect(res.body.data).to.not.be.empty; // Assert. Take away "not" to confirm assertion is asserting correctly
    });
    it('GET /users | query parameters - get active females', async () => {
        const url = `users?access-token=${token}&gender=female&status=active`;
        const res = await request.get(url);
        //console.log(res.body.data);
        res.body.data.forEach((user) => {
            //console.log(user.gender);
            expect(user.gender).to.eq('female');
            expect(user.status).to.eq('active');
        });
    });
    it('POST /users', async() => {
        const data = createRandomUser();
        const res = await request
            .post('users')
            .set('Authorization', `Bearer ${token}`)
            .send(data);
        //console.log(res.body.data);
        expect(res.body.data).to.include(data);
        expect(res.body.data).to.have.property('id');
        expect(res.body.data).to.have.property('email');
        userId = res.body.data.id;
    });
    it('POST /users | Negative', async () => {
        const data = {};
        const res = await request
            .post('users')
            .set('Authorization', `Bearer ${token}`)
            .send(data);
            //console.log(res.body.code);
            expect(res.body.code).to.eq(422);
    });
    it('GET /users/:id | User we just created', async () => {
        const res = await request.get(`users/${userId}?access-token=${token}`);
        expect(res.body.data.id).to.eq(userId);
    });
    it('PUT /users/:id', async () => {
        const data = {
            name: 'Test user updated'
        };
        const res = await request.put(`users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(data);
        expect(res.body.data.name).to.equal(data.name);
        expect(res.body.data).to.include(data);
    });
    it('DELETE /users/:id | User we just created', async () => {
        const res = await request.delete(`users/${userId}`)
            .set('Authorization', `Bearer ${token}`);
        //console.log(res.body.data);
        expect(res.body.data).to.be.null;
    });
    it('GET /users/:id | Negative', async () => {
        const res = await request.get(`users/${userId}`);
        //console.log(res.body.data.message);
        expect(res.body.data.message).to.eq('Resource not found');
    });
    it('DELETE /users/:id | Negative', async () => {
        const res = await request.delete(`users/${userId}`)
            .set('Authorization', `Bearer ${token}`);
        //console.log(res.body.data.message);
        expect(res.body.data.message).to.equal('Resource not found');
    })
    //console.log(createRandomUser());
});