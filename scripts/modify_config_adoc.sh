addPageLayoutAttribute () {
    # insert page-layout attribute
    sed '1 i\
:page-layout: config
' "$1" > newConfig.adoc
    
    mv newConfig.adoc "$1"
}

export -f addPageLayoutAttribute

find src/main/content/config -name *.adoc -exec bash -c 'addPageLayoutAttribute {}' \;