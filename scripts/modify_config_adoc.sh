addPageLayoutAttribute () {
    # insert page-layout attribute
    echo "Adding page layout..."

    sed '1 i\
    :page-layout: config
    ' "$1" > newConfig.adoc
    
    mv -f newConfig.adoc "$1"
    echo "Done adding page layout..."
}

export -f addPageLayoutAttribute

find src/main/content/config -name *.adoc -exec bash -c 'addPageLayoutAttribute {}' \;