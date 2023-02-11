var matching = function() {
  if (document.getElementById('Password').value == document.getElementById('confpw').value) {
    document.getElementById('message').style.color = 'green';
    document.getElementById('message').innerHTML = 'Passwords matching';
  }
  else {
    document.getElementById('message').style.color = 'red';
    document.getElementById('message').innerHTML = 'Passwords NOT matching / Re-enter';
  }
}