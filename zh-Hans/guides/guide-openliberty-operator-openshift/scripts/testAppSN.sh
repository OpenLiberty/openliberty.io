#!/bin/bash
set -euxo pipefail

delete_oc () {
    oc delete -f deploy.yaml
    oc delete imagestream.image.openshift.io/system-imagestream
    oc delete bc system-buildconfig
}

cd /home/project/guide-openliberty-operator-openshift/finish

mvn clean package
oc process -f build.yaml | oc create -f - || exit 1
oc start-build system-buildconfig --from-dir=system/. || exit 1
sleep 240

time_out=0
while :
do
    if [ "$(oc logs build/system-buildconfig-1 | grep "Push successful")" = "Push successful" ];
    then
        echo Build Complete
        break
    fi

    time_out=$((time_out + 1))
    sleep 15

    if [ "$time_out" = "12" ]; 
    then
        echo Unable to build
        oc logs build/system-buildconfig-1
        oc delete imagestream.image.openshift.io/system-imagestream
        oc delete bc system-buildconfig
        exit 1
    fi
done

oc get imagestreams
oc describe imagestream/system-imagestream

sed -i 's=v1=v1beta2=g' deploy.yaml
sed -i 's=9443=9080=g' deploy.yaml
sed -i 's=HTTPS=HTTP=g' deploy.yaml
sed -i 's=guide/system-imagestream:1.0-SNAPSHOT='"$SN_ICR_NAMESPACE"'/system-imagestream:1.0-SNAPSHOT\n  pullPolicy: Always\n  pullSecret: icr=g' deploy.yaml
oc apply -f deploy.yaml

has_event=$(oc describe olapps/system | grep "Event.*<none>" | cat); if [ "$has_event" = "" ]; then echo Unexpected event has occured; exit 1; fi

time_out=0
while :
do
    if [ ! "$(curl -Is http://"$(oc get routes system -o jsonpath='{.spec.host}')/health" | grep "200 OK")" = "" ];
    then
        break
    fi
    
    time_out=$((time_out + 1))
    sleep 5

    if [ "$time_out" = "36" ]; 
    then
        echo Unable to reach /health endpoint
        echo Try rerunning the this test script
        oc get pods
        delete_oc
        exit 1
    fi
done

curl -Is http://"$(oc get routes system -o jsonpath='{.spec.host}')/system/properties" | grep "200 OK" || echo Failure deploying container | exit 1

delete_oc

echo Tests Passed!
