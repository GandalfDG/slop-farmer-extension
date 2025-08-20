extends Node2D

@export var rows: int = 5
@export var cols: int = 5

@export var offset: float = 55.0

var grid: Array[Array]

var token = preload("res://token.tscn")

func _ready():
	for row in rows:
		grid.append([])
		for column in cols:
			var token_node = token.instantiate()
			add_child(token_node)
			token_node.position = Vector2(offset*row, offset*column)
			grid[row].append(token_node)
			
	calculate_token_groups()
			
func populate_grid():
	pass
	
func calculate_token_groups():
	for row in rows:
		for col in cols:
			var current_token = grid[row][col]
			var adjacent_token_coords = [
				[row - 1, col],
				[row, col + 1],
				[row + 1, col],
				[row, col - 1]
			]
			
			var valid_coords = adjacent_token_coords.filter(
				func(coord_pair): return coord_pair[0] >= 0 and coord_pair[0] < rows and coord_pair[1] >= 0 and coord_pair[1] < cols
			)
			
			for coord in valid_coords:
				if grid[coord[0]][coord[1]].type == current_token.type:
					print(coord)
