#!/bin/bash
kubectl delete -f services.yaml
kubectl delete -f traffic.yaml
kubectl label namespace default istio-injection-
istioctl x uninstall --purge --skip-confirmation

eval $(minikube docker-env -u)
sudo minikube stop
sudo minikube delete
