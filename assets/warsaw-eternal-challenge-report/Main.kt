package org.example

import java.io.File
import java.net.URL

@JvmInline
value class Card(val name: String)

data class CardInDeck(val count: Int, val card: Card)

data class Deck(val name: String, val maindeck: List<CardInDeck>, val sideboard: List<CardInDeck>)

fun main() {
    val decksDirectory = object {}.javaClass.getResource("/decks")
    val decks = constructDecksBasedOn(decksDirectory)

//    printAllCardOccurrences(decks)
//
//    printTotalNumberOfCards(decks)


    val playsetsPerDeck = decks
        .map { it.maindeck + it.sideboard }
        .flatMap { extractCardsThatOccurNTimesFrom(it, 1) }
        .map { it.key }
        .toMutableSet()

//    for (i in 1..3) {
//        val nonPlaysets = decks
//            .map { it.maindeck + it.sideboard }
//            .flatMap { extractCardsThatOccurNTimesFrom(it, i) }
//            .map { it.key }
//            .toSet()
//
//        playsetsPerDeck -= nonPlaysets
//    }

    playsetsPerDeck
        .map { it.name }
        .forEach(::println)
//        .count()
//        .also { println(it) }
}

fun extractCardsThatOccurNTimesFrom(fullList: List<CardInDeck>, n: Int) = fullList
    .flatMap { cardInDeck -> (0..<cardInDeck.count).map { cardInDeck.card } }
    .groupingBy { it }
    .eachCount()
    .entries
    .filter { it.value == n }
    .toList()


private fun printTotalNumberOfCards(decks: List<Deck>) {
    decks
        .flatMap { it.maindeck + it.sideboard }
        .flatMap { cardInDeck -> (0..<cardInDeck.count).map { cardInDeck.card } }
        .count()
        .also { println(it) }
}

fun printAllCardOccurrences(decks: List<Deck>) {
    decks
        .flatMap { it.maindeck + it.sideboard }
        .flatMap { cardInDeck -> (0..<cardInDeck.count).map { cardInDeck.card } }
        .groupingBy { it }
        .eachCount()
        .entries
        .sortedByDescending { it.value }
        .forEach { println("${it.value} ${it.key}") }
}

private fun constructDecksBasedOn(decksDirectory: URL?) = File(decksDirectory!!.toURI())
    .walk()
    .filter { it.isFile }
    .map { it.name.substringBefore(" — ") to it.readText() }
    .map { (deckName, deckListText) -> Deck(deckName, maindeckFrom(deckListText), sideboardFrom(deckListText)) }
    .toList()

private fun maindeckFrom(fileContent: String) = fileContent
    .lines()
    .takeWhile(String::isNotEmpty)
    .map { it.substringBefore(" ").toInt() to it.substringAfter(" ") }
    .map { (count, cardName) -> CardInDeck(count, Card(cardName.trim())) }
    .toList()

private fun sideboardFrom(fileContent: String) = fileContent
    .lines()
    .dropWhile(String::isNotEmpty)
    .drop(1) // empty line that separates sideboard from the maindeck
    .dropLast(1) // empty line at the end of the file
    .map { it.substringBefore(" ").toInt() to it.substringAfter(" ") }
    .map { (count, cardName) -> CardInDeck(count, Card(cardName.trim())) }
    .toList()