#!/bin/bash
kubectl delete -f kubernetes
eval $(minikube docker-env -u)
minikube stop
minikube delete
