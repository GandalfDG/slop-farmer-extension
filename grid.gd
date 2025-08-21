extends Node2D

@export var rows: int = 5
@export var cols: int = 5

@export var offset: float = 55.0

var grid: Array[Array]
var groups: Array

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
	
func to_grid_coord(idx):
	pass
	
func to_index(idx):
	pass
	
func calculate_token_groups():
	groups = []
	var visited_nodes = []
	var group_queue = []
	for row in rows:
		for col in cols:
			if [row, col] in visited_nodes:
				continue
				
			group_queue.append([row,col])
			
			var new_group = []
			while not group_queue.is_empty():
				var current_coord = group_queue.pop_back()
				var current_token = grid[current_coord[0]][current_coord[1]]
				new_group.append(current_coord)
				visited_nodes.append(current_coord)
			
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
					if coord not in visited_nodes and grid[coord[0]][coord[1]].type == current_token.type:
						group_queue.append(coord)
			groups.append(new_group)
			
	print(groups)
