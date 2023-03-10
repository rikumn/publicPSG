<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    //$dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    //$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();
    
    $_usuario = $_POST['usuario'];
    $_ingredientes = explode(",", $_POST['id_ingredientes']);
    
    $sth = $dbh->prepare('SELECT `ID` FROM `PotionSeller_db` WHERE `WalletAddress` = :usuario');
    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
    $sth->execute();    

    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();

    if (count($result) > 0) 
    {
        $_ID = $result[0]['ID'];
        $_filtro_1 = "";

        for($i = 0; $i < count($_ingredientes); ++$i)
        {
            //SELECT * FROM `MagicPower`WHERE (IngrID =1 OR IngrID =2 OR IngrID =3) AND UserID=3
            $_filtro_1 .= " IngrID = " . $_ingredientes[$i];
            if($i < count($_ingredientes) - 1) { $_filtro_1 .= " OR "; } else { $_filtro_1 .= " "; }
        }
        
        $sth = $dbh->prepare('SELECT * FROM `MagicPower` WHERE ('.$_filtro_1.') AND UserID='.$_ID);
        $sth->execute();

        $sth->setFetchMode(PDO::FETCH_ASSOC); 
        $result = $sth->fetchAll();
        
        if (count($result) > 0)
        {
            for($i = 0; $i < count($result); ++$i)
            {
                echo $result[$i]['PricePr'];
                if($i < count($result) - 1) { echo ","; }
            }
        }
        else
        {    
            //ID > 0=8, 1=5, 2=5, 3=3, 4=5, 5=9
            //SELECT * FROM MagicPower WHERE (IngrID=4 or IngrID=3 or IngrID=2) AND UserID=3;
            
            $_filtro_2 = "";

            for($i = 0; $i < count($_ingredientes); ++$i)
            {
                $_filtro_2 .= " IDIngrediente = " . $_ingredientes[$i] . " ";
                if($i < count($_ingredientes) - 1) { $_filtro_2 .= " OR "; }
            }
            
            $sth = $dbh->prepare('SELECT * FROM `Phytoness` WHERE ('.$_filtro_2.')');
            $sth->execute();

            $sth->setFetchMode(PDO::FETCH_ASSOC); 
            $result = $sth->fetchAll();
            
            for($i = 0; $i < count($result); ++$i)
            {
                echo $result[$i]['Precio'];
                if($i < count($result) - 1) { echo ","; }
            }
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
