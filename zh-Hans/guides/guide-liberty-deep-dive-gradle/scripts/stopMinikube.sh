#!/bin/bash
kubectl delete -f inventory.yaml
eval '$(minikube docker-env -u)'
minikube stop
minikube delete