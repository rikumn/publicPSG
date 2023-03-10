<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();
    
    $_usuario = $_POST['usuario'];

    $sth = $dbh->prepare('SELECT `ID` FROM `PotionSeller_db` WHERE `WalletAddress` = :usuario');
    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
    $sth->execute();    
    
    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();

    if (count($result) > 0) 
    {
        $_ID = $result[0]['ID'];
        $sth = $dbh->prepare('SELECT `Power` FROM `PocionesMagicPower`WHERE Estado=1 AND IDUsuario=:IDUsuario');
        $sth->bindParam(':IDUsuario', $_ID, PDO::PARAM_INT);
        $sth->execute();

        $sth->setFetchMode(PDO::FETCH_ASSOC); 
        $result = $sth->fetchAll();
        $_totalpower = 0;

        for($i = 0; $i < count($result); ++$i)
        {
            $_totalpower += $result[$i]['Power'];
        }

        if (count($result) > 0) 
        {
            echo $_totalpower;
        }
        else
        {
            echo 'no se encontro pociones!';
        }
    }
    else
    {
        echo 'no se encontro el usuario!';
    }
    $dbh->commit();
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>
