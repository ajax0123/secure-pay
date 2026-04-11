const data = { email: 'testlogin_20260410003013@example.com', password: 'password123' };
const url = 'http://127.0.0.1:5000/api/auth/login';
fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  .then(async res => {
    console.log('status', res.status);
    console.log(await res.text());
  })
  .catch(err => {
    console.error('error', err);
  });
