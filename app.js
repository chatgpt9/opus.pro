const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send(`
    <form action="/" method="post">
      <label for="youtubeLink">Enter YouTube Link:</label>
      <input type="text" name="youtubeLink" id="youtubeLink">
      <button type="submit">Convert</button>
    </form>
  `);
});

app.post('/', (req, res) => {
  const { youtubeLink } = req.body;

  // Run ffmpeg command to crop and merge the video
  const command = `ffmpeg -i ${youtubeLink} -filter_complex "[0:v]crop=iw/2:ih:ow/2:0[left];[0:v]crop=iw/2:ih:0:0[right];[left][right]vstack=inputs=2" output.mp4`;

  exec(command, (error) => {
    if (error) {
      console.error('Error:', error);
      res.send('An error occurred while processing the video.');
    } else {
      res.sendFile(__dirname + '/output.mp4');
    }
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
