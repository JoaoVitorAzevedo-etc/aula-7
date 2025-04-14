let numerosecreto =  7
let tentativa = 1

while (tentativa <= 3){
    let palpite = parseInt(prompt("Numero de 1 a 10"))
    if(palpite === numerosecreto){
        console.log("Parabéns")
        // saindo while
        break
    } else{
        console.log("Tente Novemente!")
    }
    tentativa = tentativa + 1
}
if (tentativa > 3){
    console.log("bloqueado")
}