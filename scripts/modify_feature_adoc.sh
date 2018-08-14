addPageLayoutAttribute () {
    # insert page-layout attribute
    sed '1 i\
:page-layout: feature
' "$1" > newConfig.adoc
    
    mv newConfig.adoc "$1"
}

export -f addPageLayoutAttribute

find src/main/content/feature -name *.adoc -exec bash -c 'addPageLayoutAttribute {}' \;
