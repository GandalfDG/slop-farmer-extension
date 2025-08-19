extends Node2D

@export var rows: int = 5
@export var cols: int = 5

@export var offset: float = 55.0

var grid: Array

var token = preload("res://token.tscn")

func _ready():
	for row in rows:
		grid.append([])
		for column in cols:
			var token_node = token.instantiate()
			add_child(token_node)
			token_node.position = Vector2(offset*row, offset*column)
			grid[row].append(token_node)
