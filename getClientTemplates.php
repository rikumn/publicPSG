 <?php
$myfile = fopen("ClientTemplates.txt", "r") or die("Unable to open file!");
echo fread($myfile,filesize("ClientTemplates.txt"));
fclose($myfile);
?> 