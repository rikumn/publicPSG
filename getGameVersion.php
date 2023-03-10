 <?php
$myfile = fopen("gameversion.txt", "r") or die("Unable to open file!");
echo fread($myfile,filesize("gameversion.txt"));
fclose($myfile);
?> 