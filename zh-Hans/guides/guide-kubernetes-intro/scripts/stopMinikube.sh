#!/bin/bash
kubectl delete -f kubernetes.yaml
eval $(minikube docker-env -u)
minikube stop
minikube delete
