import test from "node:test";
import assert from "node:assert/strict";

import {
  validateRegistration
} from "../src/authentication/validateUser.js";


function createRequest(body) {
  return {
    body
  };
}

function createResponse() {
  return {
    statusCode: null,
    body: null,

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(data) {
      this.body = data;
      return this;
    }
  };
}


test("accepts a valid email and password", () => {
  const req = createRequest({
    email: "test@example.com",
    password: "Password123"
  });

  const res = createResponse();

  let nextCalled = false;

  function next() {
    nextCalled = true;
  }

  validateRegistration(req, res, next);

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});


test("rejects a missing email", () => {
  const req = createRequest({
    password: "Password123"
  });

  const res = createResponse();

  let nextCalled = false;

  function next() {
    nextCalled = true;
  }

  validateRegistration(req, res, next);

  assert.equal(res.statusCode, 400);

  assert.deepEqual(res.body, {
    success: false,
    message: "Email and password are required"
  });

  assert.equal(nextCalled, false);
});


test("rejects a missing password", () => {
  const req = createRequest({
    email: "test@example.com"
  });

  const res = createResponse();

  let nextCalled = false;

  function next() {
    nextCalled = true;
  }

  validateRegistration(req, res, next);

  assert.equal(res.statusCode, 400);

  assert.deepEqual(res.body, {
    success: false,
    message: "Email and password are required"
  });

  assert.equal(nextCalled, false);
});


test("rejects an invalid email", () => {
  const req = createRequest({
    email: "not-an-email",
    password: "Password123"
  });

  const res = createResponse();

  let nextCalled = false;

  function next() {
    nextCalled = true;
  }

  validateRegistration(req, res, next);

  assert.equal(res.statusCode, 400);

  assert.deepEqual(res.body, {
    success: false,
    message: "Invalid email address"
  });

  assert.equal(nextCalled, false);
});


test("rejects a password shorter than 8 characters", () => {
  const req = createRequest({
    email: "test@example.com",
    password: "1234567"
  });

  const res = createResponse();

  let nextCalled = false;

  function next() {
    nextCalled = true;
  }

  validateRegistration(req, res, next);

  assert.equal(res.statusCode, 400);

  assert.deepEqual(res.body, {
    success: false,
    message: "Password must be at least 8 characters"
  });

  assert.equal(nextCalled, false);
});


test("accepts a password with exactly 8 characters", () => {
  const req = createRequest({
    email: "test@example.com",
    password: "12345678"
  });

  const res = createResponse();

  let nextCalled = false;

  function next() {
    nextCalled = true;
  }

  validateRegistration(req, res, next);

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});