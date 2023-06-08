const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/convert', upload.single('video'), (req, res) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  // Execute FFmpeg command to crop and merge video
  const inputFilePath = req.file.path;
  const outputFilePath = `output_${Date.now()}.mp4`;
  const command = `ffmpeg -i ${inputFilePath} -filter_complex "[0:v]crop=iw/2:ih/2:0:ih/4[top];[0:v]crop=iw/2:ih/2:iw/2:ih/4[bottom];[top][bottom]vstack" ${outputFilePath}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`FFmpeg error: ${error}`);
      res.status(500).send('Error occurred during video processing.');
      return;
    }

    console.log(`FFmpeg output: ${stdout}`);

    // Send the final video file to the user
    res.download(outputFilePath, (err) => {
      if (err) {
        console.error(`File download error: ${err}`);
        res.status(500).send('Error occurred during file download.');
      }

      // Cleanup the temporary files
      fs.unlink(inputFilePath, (unlinkError) => {
        if (unlinkError) {
          console.error(`Input file deletion error: ${unlinkError}`);
        }
      });

      fs.unlink(outputFilePath, (unlinkError) => {
        if (unlinkError) {
          console.error(`Output file deletion error: ${unlinkError}`);
        }
      });
    });
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
