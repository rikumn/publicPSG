<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();
    
    $_usuario = $_POST['usuario'];

    $sth = $dbh->prepare('SELECT * FROM `PotionSeller_db` WHERE `WalletAddress` = :usuario');
    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
    $sth->execute();
    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();

    if (count($result) > 0){
        $user_id = $result[0]['ID'];

        //porque en db es de 1 a 6
        for ($i=1; $i < 7; $i++) { 
            $ingr_qt = $_POST['ingr_qt'.$i];
            $ingr_st = $_POST['ingr_st'.$i];
            $ingr_dqt = $_POST['ingr_dqt'.$i];
            
            $sth = $dbh->prepare('SELECT * FROM `MagicPower` WHERE `IngrID` = :IngrID AND `UserID` = :UserID');
            $sth->bindParam(':IngrID', $i, PDO::PARAM_INT);
            $sth->bindParam(':UserID', $user_id, PDO::PARAM_INT);
            $sth->execute();
            $sth->setFetchMode(PDO::FETCH_ASSOC); 
            $result = $sth->fetchAll();

            if (count($result)>0){
                $denominador = $ingr_qt + $ingr_dqt;
                $nominador = ($result[0]['PricePr'] * $ingr_dqt) + ($ingr_st * $ingr_qt);
                $aux = $result[0]['PricePr'];
                if ($denominador > 0){
                    $aux = ($nominador/ $denominador);
                }
                $TotalSpend = $ingr_st * $ingr_qt;
                $sth = $dbh->prepare('UPDATE `MagicPower` 
                SET `TotalQuantity`=:TotalQuantity,`TotalSpend`=:TotalSpend,`PricePr`=:PricePr WHERE `IngrID`=:IngrID AND UserID = :UserID');
                $sth->bindParam(':TotalQuantity', $ingr_dqt, PDO::PARAM_INT);
                $sth->bindParam(':TotalSpend', $TotalSpend, PDO::PARAM_INT);
                $sth->bindParam(':PricePr', $aux, PDO::PARAM_STR);
                $sth->bindParam(':IngrID', $i, PDO::PARAM_INT);
                $sth->bindParam(':UserID', $user_id, PDO::PARAM_INT);
                $sth->execute(); 
            }else{
                $sth = $dbh->prepare('SELECT * FROM `Phytoness` WHERE `IDIngrediente` = :IDIngrediente');
                $sth->bindParam(':IDIngrediente', $i, PDO::PARAM_INT);
                $sth->execute(); 
                $sth->setFetchMode(PDO::FETCH_ASSOC); 
                $result = $sth->fetchAll();

                $denominador = $ingr_qt + $ingr_dqt;
                $nominador = ($result[0]['Precio'] * $ingr_dqt) + ($ingr_st * $ingr_qt);
                $aux = $result[0]['Precio'];
                if ($denominador > 0){
                    $aux = ($nominador/ $denominador);
                }
                $TotalSpend = $ingr_st * $ingr_qt;
                $sth = $dbh->prepare('INSERT INTO `MagicPower`(`UserID`, `IngrID`, `TotalQuantity`, `TotalSpend`, `PricePr`) VALUES (:UserID , :IngrID, :TotalQuantity, :TotalSpend, :PricePr)');
                $sth->bindParam(':UserID', $user_id, PDO::PARAM_INT);
                $sth->bindParam(':IngrID', $i, PDO::PARAM_INT);
                $sth->bindParam(':TotalQuantity', $ingr_dqt, PDO::PARAM_INT);
                $sth->bindParam(':TotalSpend', $TotalSpend, PDO::PARAM_INT);
                $sth->bindParam(':PricePr', $aux, PDO::PARAM_STR);
                $sth->execute(); 
            }
        }
    }
    else{
        echo 'user not found!';
    }

    

    $dbh->commit();
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>
