call mvn -pl system ^
         -ntp clean package liberty:create liberty:install-feature liberty:deploy
call mvn -pl query ^
         -ntp clean package liberty:create liberty:install-feature liberty:deploy

call mvn -pl system ^
         -ntp -P testing liberty:start
call mvn -pl query ^
         -ntp -Dliberty.var.mp.config.profile="testing" liberty:start

call mvn -pl system ^
         -ntp -P testing failsafe:integration-test
call mvn -pl query ^
         -ntp failsafe:integration-test

call mvn -pl query ^
         -ntp liberty:stop
call mvn -pl system ^
         -ntp liberty:stop
