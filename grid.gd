extends Node2D

var rows: int = 5
var cols: int = 5

var grid: Array

var token = preload("res://token.tscn")

func _ready():
	for row in rows:
		grid.append([])
		for column in cols:
			var token_node = token.instantiate()
			add_child(token_node)
			token_node.position = Vector2(10*row, 10*column)
			grid[row].append(token_node)
