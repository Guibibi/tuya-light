$(function () {
  $('#on').on('click', () => {
    fetch('/api/on');
  });

  $('#off').on('click', () => {
    fetch('/api/off');
  });

  $('#white').on('click', () => {
    fetch('/api/white');
  });

  $('#colour').on('click', () => {
    fetch('/api/colour');
  });

  $('#police').on('click', () => {
    fetch('/api/police');
  });

  $('#status').on('click', () => {
    fetch('/api/status');
  });
});
