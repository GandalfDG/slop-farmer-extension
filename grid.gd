extends Node2D
class_name Grid

@export var rows: int = 5
@export var cols: int = 5
@export var min_group_size: int = 3

@export var offset: float = 55.0

var grid: Array[Array]
var groups: Array
var hovered_group: Array

var debug_label: Label

var token = preload("res://token.tscn")

func _ready():
	debug_label = $"Debug Label"

	for row in rows:
		grid.append([])
		for column in cols:
			var token_node: Token = token.instantiate()
			add_child(token_node)
			token_node.position = Vector2(offset*column, offset*row)
			token_node.set_type(randi_range(0,3) as Token.token_type)
			token_node.set_debug_label(str(row) + "," + str(column))
			token_node.token_clicked.connect(_on_token_clicked.bind([row,column]))
			token_node.token_hovered.connect(_on_token_hovered.bind([row,column]))
			grid[row].append(token_node)

	calculate_token_groups()

func _on_token_clicked(token_coord):
	var group = get_group_of_token(token_coord)
	if group.size() >= min_group_size:
		for coord in group:
			var current_token = grid[coord[0]][coord[1]] as Token
			current_token.queue_free()
			grid[coord[0]][coord[1]] = null # do I actually want a null value or should there be some other placeholder?

		update_grid()

func _on_token_hovered(enter: bool, coord: Array):
	var group = get_group_of_token(coord)
	if enter:
		highlight_group(group, true)
	else:
		highlight_group(group, false)

func highlight_group(group: Array, enable: bool):
	if group != hovered_group:
#		Un-highlight current, update current
		for coord in hovered_group:
			var current_token = grid[coord[0]][coord[1]]
			current_token.set_highlighted(false)

	for coord in group:
		var current_token = grid[coord[0]][coord[1]] as Token
		current_token.set_highlighted(enable)

	hovered_group = group

func update_grid():
#	search for empty cells and drop tokens above them down

# search for empty coluns and shift tokens horizontally to fill them
	pass

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
					[current_coord[0] - 1, current_coord[1]],
					[current_coord[0], current_coord[1] + 1],
					[current_coord[0] + 1, current_coord[1]],
					[current_coord[0], current_coord[1] - 1]
				]

				var valid_coords = adjacent_token_coords.filter(
					func(coord_pair):
						return (
							coord_pair[0] >= 0 and
							coord_pair[0] < rows and
							coord_pair[1] >= 0 and
							coord_pair[1] < cols
						)
				)

				for coord in valid_coords:
					if (coord not in visited_nodes and
						grid[coord[0]][coord[1]].type == current_token.type and
						coord not in group_queue):
						group_queue.append(coord)
			groups.append(new_group)

	debug_label.text = str(groups)

func get_group_of_token(token_coord) -> Array:
	for group in groups:
		if token_coord in group:
			return group

	return []
