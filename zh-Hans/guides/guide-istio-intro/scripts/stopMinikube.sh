#!/bin/bash
kubectl delete -f system.yaml
kubectl delete -f traffic.yaml
kubectl label namespace default istio-injection-
istioctl x uninstall --purge --skip-confirmation

eval $(minikube docker-env -u)
minikube stop
minikube delete
